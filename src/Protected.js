import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Box from "@material-ui/core/Box";
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Alert from '@material-ui/lab/Alert';
import { withStyles } from '@material-ui/core/styles';
import withAuth from './withAuth';
import Manage from './Manage';
import Register from './Register';
import { myConfig } from './config.js';

const styles = theme => ({
	root: {
		flexGrow: 1,
	},
	paper: {
		marginTop: theme.spacing(8),
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
			manageClicked: false
		};
	}

	handleOpenCloseGate = () => {
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
			this.setState({successes: [...this.state.successes, json.msg]});
			console.log(this.state.successes);
			setTimeout(function(self) {
				self.setState({successes:[]});
			}, 5000, this);
		})
		.catch(error => {
			console.log(error);
		})
	};
	
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
	
	render() {
		const {classes} = this.props;
		const isAdmin = this.props.claims['user_claims']['roles'] === 'admin';
		return (
			<div className={classes.root}>
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
							</>
						}
						<Button color="inherit" onClick={this.props.logout}>Logout</Button>
					</Toolbar>
				</AppBar>
				<Container component="main" maxWidth="xs">
					<CssBaseline />
					<div className={classes.paper}>
						{(!this.state.registerClicked && !this.state.manageClicked) &&
						<>
							<div className={classes.root} style={{display:'block', minHeight: '68px'}}>
								{this.state.errors.map(error => (
									<Alert severity="error" key={error}>{error}</Alert>
								))}
								{this.state.successes.map(success => (
									<Alert severity="success" key={success}>{success}</Alert>
								))}
							</div>
							<Box
					  		  display="flex"
					  		  justifyContent="center"
					  		  alignItems="center"
					  		  minHeight="100vh"
							>
								<Button className={classes.gatecontrolbtn} variant="contained" color="secondary" size="large" onClick={this.handleOpenCloseGate}>
									Open/close gate
								</Button>
							</Box>
						</>
						}
						{this.state.registerClicked &&
							<Register />
						}
						{this.state.manageClicked &&
							<Manage />
						}
					</div>
				</Container>
			</div>
		);
	}
}

Protected.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withAuth()(withStyles(styles)(Protected));
