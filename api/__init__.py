from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token, get_jwt_identity,
                                get_jwt_claims, jwt_required)
import logging
import paho.mqtt.client as mqtt
import os
from sys import stdout
from werkzeug.security import check_password_hash, generate_password_hash
from . import db
from api.db import get_db
from api.config import JWT_SECRET_KEY, SECRET_KEY, MQTT_BROKER, MQTT_USER, MQTT_PASSWORD
try:
    from api.config import DEVICE_TOPIC
except ImportError:
    DEVICE_TOPIC = 'gate'
OPEN = 0
CLOSED = 1
logger = logging.getLogger()
logging.basicConfig(stream=stdout, level=logging.DEBUG, format="%(asctime)s %(message)s",
                    datefmt="%m/%d/%Y %I:%M:%S %p")

class BadRequest(Exception):
    """Custom exception class to be thrown when local error occurs."""
    def __init__(self, message, status=400, payload=None):
        self.message = message
        self.status = status
        self.payload = payload

def activate_relay(mqtt_client):
    mqtt_client.publish('cmnd/{}/Power2'.format(DEVICE_TOPIC), 'TOGGLE')

def update_gate_state(app):
    if app.gate_state == CLOSED:
        app.gate_state = OPEN
        action = 'opened'
    else:
        app.gate_state = CLOSED
        action = 'closed'
    return action

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True, static_folder='../build', static_url_path='/')
    
    app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
    app.config['CORS_HEADERS'] = 'Content-Type'
    app.config['PROPAGATE_EXCEPTIONS'] = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.jinja_env.auto_reload = True
    app.config.from_mapping(
        SECRET_KEY=SECRET_KEY,
        DATABASE=os.path.join(app.instance_path, 'api.sqlite'),
    )
    app.gate_state = CLOSED
    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    db.init_app(app)

    jwt = JWTManager(app)
    CORS(app)

    mqtt_client = mqtt.Client('P1')
    mqtt_client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
    mqtt_client.connect(MQTT_BROKER)

    @app.errorhandler(BadRequest)
    def handle_bad_request(error):
        """Catch BadRequest exception globally, serialize into JSON, and respond with 400."""
        payload = dict(error.payload or ())
        payload['status'] = error.status
        payload['message'] = error.message
        return jsonify(payload), 400
    
    @jwt.user_claims_loader
    def add_claims_to_access_token(user):
        userdb = get_db()
        user_claims = userdb.execute(
            'SELECT roles FROM claims WHERE user_id = ?', (user['id'],)
        ).fetchone()
        return {'roles': user_claims['roles']}

    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return user['username']

    @app.route('/api/delete', methods=['POST'])
    @jwt_required
    def delete():
        current_roles = get_jwt_claims()['roles']
        if current_roles != 'admin':
            raise BadRequest("You don't have authority to perform this action", 40007, {'ext': 1})
        else:
            userdb = db.get_db()
            req_json = request.get_json()
        
            if not req_json:
                raise BadRequest('Missing JSON', 400, {'ext': 1})
            
            userdata = req_json.get('userdata')
            
            for user in userdata:
                if user['del']:
                    userdb.execute('DELETE FROM user WHERE id = ?', (user['userid'],))
                    userdb.commit()
                    userdb.execute('DELETE FROM claims WHERE user_id = ?', (user['userid'],))
                    userdb.commit()
                    return jsonify({'msg': 'Successfully deleted user(s)'}), 200

    @app.route('/api/list_users', methods=['GET'])
    @jwt_required
    def list_users():
        current_roles = get_jwt_claims()['roles']
        if current_roles != 'admin':
            raise BadRequest("You don't have authority to perform this action", 40007, {'ext': 1})
        else:
            userdb = db.get_db()
            users = userdb.execute('SELECT * FROM user').fetchall()
            userdata = [{'userid': user['id'], 'username': user['username']} for user in users]
            return jsonify({'users': userdata}), 200
    
    @app.route('/api/register', methods=['POST'])
    @jwt_required
    def register():
        current_roles = get_jwt_claims()['roles']
        if current_roles != 'admin':
            raise BadRequest("You don't have authority to perform this action", 40007, {'ext': 1})
        else:
            userdb = db.get_db()
            reg_json = request.get_json()
        
            if not reg_json:
                raise BadRequest('Missing JSON', 400, {'ext': 1})
        
            username = reg_json.get('username')
            password = reg_json.get('password')
            role = reg_json.get('role')
        
            if not username:
                raise BadRequest('Username is missing', 40004, {'ext': 1})
            elif not password:
                raise BadRequest('Password is missing', 40005, {'ext': 1})
            elif not role:
                raise BadRequest('Role is missing', 40006, {'ext': 1})
            elif userdb.execute(
                'SELECT id FROM user WHERE username = ?', (username,)
            ).fetchone() is not None:
                raise BadRequest('User {} is already registered.'.format(username), 40008, {'ext': 1})
    
            userdb.execute(
                'INSERT INTO user (username, password) VALUES (?, ?)',
                (username, generate_password_hash(password))
            )
            userdb.commit()
            user = userdb.execute(
                'SELECT id FROM user WHERE username = ?', (username,)
            ).fetchone()
            userdb.execute(
                'INSERT INTO claims (user_id, roles) VALUES (?, ?)',
                (user['id'], role)
            )
            userdb.commit()
            
            return jsonify({'msg': 'Successfully registered user'}), 200

    @app.route('/api/login', methods=['POST'])
    def login():
        userdb = db.get_db()
        login_json = request.get_json()
    
        if not login_json:
            raise BadRequest('Missing JSON', 400, {'ext': 1})
    
        username = login_json.get('username')
        password = login_json.get('password')
    
        if not username:
            raise BadRequest('Username is missing', 40001, {'ext': 1})
    
        if not password: 
            raise BadRequest('Password is missing', 40002, {'ext': 1})
    
        user = userdb.execute(
            'SELECT * FROM user WHERE username = ?', (username,)
        ).fetchone()
    
        if not user or not check_password_hash(user['password'], password):
            raise BadRequest('Invalid username or password', 40003, {'ext': 1})

        access_token = create_access_token(identity=user)
        
        logger.info('%s successfully logged in', username)
        
        return jsonify({'access_token': access_token}), 200
    
    @app.route('/api/open_close_gate', methods=['GET'])
    @jwt_required
    def open_close_gate():
        current_roles = get_jwt_claims()['roles']
        if not current_roles in ['user', 'admin']:
            raise BadRequest("You don't have authority to perform this action", 40007, {'ext': 1})
        else:
            activate_relay(mqtt_client)
            action = update_gate_state(app)
            current_user = get_jwt_identity()
            logger.info('%s successfully %s gate', current_user, action)
        return jsonify({'msg': "Successfully {:s} gate".format(action)}), 200

    @app.route('/api/toggle_gate_state', methods=['GET'])
    @jwt_required
    def toggle_gate_state():
        current_roles = get_jwt_claims()['roles']
        if current_roles != 'admin':
            raise BadRequest("You don't have authority to perform this action", 40007, {'ext': 1})
        else:
            if app.gate_state == CLOSED:
                app.gate_state = OPEN
                current_state = 'open'
            else:
                app.gate_state = CLOSED
                current_state = 'closed'
        return jsonify({'msg': "Successfully changed gate state to {:s}".format(current_state)}), 200

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    return app
