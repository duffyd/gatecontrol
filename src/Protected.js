import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Box from "@material-ui/core/Box";
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

const styles = theme => ({
	root: {
		flexGrow: 1,
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
			registerClicked: false,
			manageClicked: false
		};
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
				{(!this.state.registerClicked && !this.state.manageClicked) &&
					<Box
					  display="flex"
					  justifyContent="center"
					  alignItems="center"
					  minHeight="100vh"
					>
						<div className={classes.root} style={{display:'block', minHeight: '68px'}}>
							{this.state.errors.map(error => (
								<Alert severity="error" key={error}>{error}</Alert>
							))}
						</div>
						<Button className={classes.gatecontrolbtn} variant="contained" color="secondary" size="large" onClick={() => { alert('clicked') }}>
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
		);
	}
}

Protected.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withAuth()(withStyles(styles)(Protected));