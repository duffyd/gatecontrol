import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Box from "@material-ui/core/Box";
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ToggleOffIcon from '@material-ui/icons/ToggleOff';
import { withStyles } from '@material-ui/core/styles';
import withAuth from './withAuth';
import Manage from './Manage';
import Register from './Register';
import AlertMessage from "./AlertMessage";
import { myConfig } from './config.js';

const styles = theme => ({
	root: {
		flexGrow: 1,
	},
	paper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	title: {
		flexGrow: 1,
	},
	button: {
		margin: theme.spacing(1),
	},
})

class Protected extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: '',
			errors: [],
			successes: [],
			registerClicked: false,
			manageClicked: false,
			isSubmitting: false
		};
	}

	handleOpenCloseGate = () => {
		this.setState({isSubmitting: true});
		fetch(`http://${myConfig.apiUrl}/api/open_close_gate`, {
			method: 'GET',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${window.localStorage.accessToken}`
			}
		})
		.then(response => {
			console.log('Got response');
			this.setState({isSubmitting: false});
			if (response.ok) {
				return response.json();
			}
			if (response.status === 400) {
				return response.json()
					.then(responseJson => {
						if (/^4.*$/.test(responseJson.status.toString())) {
							this.setState({errors: [...this.state.errors, responseJson.message]});
							setTimeout(function(self) {
								self.setState({errors: []});
							}, 5000, this);
						}
						throw responseJson;
					})
			}
		})
		.then(json => {
			try {
				this.setState({successes: [...this.state.successes, json.msg]});
				console.log(this.state.successes);
				setTimeout(function(self) {
					self.setState({successes:[]});
				}, 5000, this);
			}
			catch(error) {
				if (error instanceof TypeError) {
					this.setState({errors: [...this.state.errors, 'Lost connection with server. Please logout and login again']});
					setTimeout(function(self) {
						self.setState({errors: []});
					}, 5000, this);
					console.log(error);
				} else {
					console.log(error);
				}
			}
		})
		.catch(error => {
			console.log(error);
		})
	}
	
	openRegister = () => {
		if (this.state.registerClicked) {
			this.setState({registerClicked: false});
		} else {
			this.setState({manageClicked: false});
			this.setState({registerClicked: true});
		}
	}
	
	openManage = () => {
		if (this.state.manageClicked) {
			this.setState({manageClicked: false});
		} else {
			this.setState({registerClicked: false});
			this.setState({manageClicked: true});
		}
	}
	
	toggleGateState = () => {
		fetch(`http://${myConfig.apiUrl}/api/toggle_gate_state`, {
			method: 'GET',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${window.localStorage.accessToken}`
			}
		})
		.then(response => {
			console.log('Got response');
			if (response.ok) {
				return response.json();
			}
			if (response.status === 400) {
				return response.json()
					.then(responseJson => {
						if (/^4.*$/.test(responseJson.status.toString())) {
							this.setState({errors: [...this.state.errors, responseJson.message]});
							setTimeout(function(self) {
								self.setState({errors: []});
							}, 5000, this);
						}
						throw responseJson;
					})
			}
		})
		.then(json => {
			try {
				this.setState({successes: [...this.state.successes, json.msg]});
				console.log(this.state.successes);
				setTimeout(function(self) {
					self.setState({successes:[]});
				}, 5000, this);
			}
			catch(error) {
				if (error instanceof TypeError) {
					this.setState({errors: [...this.state.errors, 'Lost connection with server. Please logout and login again']});
					setTimeout(function(self) {
						self.setState({errors: []});
					}, 5000, this);
					console.log(error);
				} else {
					console.log(error);
				}
			}
		})
		.catch(error => {
			console.log(error);
		})
	}
	
	render() {
		const {classes} = this.props;
		const isAdmin = this.props.claims['user_claims']['roles'] === 'admin';
		return (
			<div className={classes.root}>
				<CssBaseline />
				<AppBar position="fixed">
					<Toolbar>
						<Typography variant="h6" className={classes.title}>
							Hall Gate Control
						</Typography>
						{isAdmin &&
							<>
								<IconButton onClick={this.openRegister}>
									<PersonAddIcon style={{ color: 'white' }} />
								</IconButton>
								<IconButton onClick={this.openManage}>
									<DeleteForeverIcon style={{ color: 'white' }} />
								</IconButton>
								<IconButton onClick={this.toggleGateState}>
									<ToggleOffIcon style={{ color: 'white' }} />
								</IconButton>
							</>
						}
						<Button color="inherit" onClick={this.props.logout}>Logout</Button>
					</Toolbar>
				</AppBar>
				<div className={classes.paper}>
					{(!this.state.registerClicked && !this.state.manageClicked) &&
					<Box
					  display="flex"
					  justifyContent="center"
					  alignItems="center"
					  minHeight="100vh"
					>
						{this.state.errors.map(error => (
							<AlertMessage key={Math.random()} message={error} severity={'error'} />
						))}
						{this.state.successes.map(success => (
							<AlertMessage key={Math.random()} message={success} severity={'success'} />
						))}
						<Button className={classes.gatecontrolbtn} variant="contained" color="secondary" size="large" disabled={this.state.isSubmitting} onClick={this.handleOpenCloseGate}>
							Open/close gate
						</Button>
					</Box>
					}
					{this.state.registerClicked &&
						<Register />
					}
					{this.state.manageClicked &&
						<Manage />
					}
				</div>
			</div>
		);
	}
}

Protected.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withAuth()(withStyles(styles)(Protected));
