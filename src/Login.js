import React from 'react';
import { Formik, Field } from 'formik';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import { Button, LinearProgress } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { TextField } from 'formik-material-ui';
import AlertMessage from "./AlertMessage";
import { myConfig } from './config.js';

interface Values {
	username: string;
	password: string;
}

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="http://emergetec.com/">
        Emerge Technology
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const styles = theme => ({
	root: {
		width: '100%',
		'& > * + *': {
			marginTop: theme.spacing(2),
		},
	},
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
})

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			password: '',
			errors: []
		};
	}

	handleLogin = values => {
		fetch(`http://${myConfig.apiUrl}/api/login`, {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: values.username,
				password: values.password
			})
		})
		.then(response => {
			const errors = [];
			if (response.ok) {
				return response.json();
			}
			if (response.status === 400) {
				return response.json()
					.then(responseJson => {
						if (/^4.*$/.test(responseJson.status.toString())) {
							errors.push(responseJson.message);
						}
						if (errors.length > 0) {
							this.setState({ errors: errors });
							setTimeout(function(self) {
								self.setState({ errors: [] });
							}, 5000, this);
						}
						throw responseJson;
					})
			}
		})
		.then(json => {
			const accessToken = json.access_token;
			this.props.onLogin(accessToken);
		})
		.catch(error => {
			console.log(error);
			this.props.onLoginError();
		});
	};

	handleUsernameChange = e => {
		this.setState({
			username: e.target.value
		});
	};

	handlePasswordChange = e => {
		this.setState({
			password: e.target.value
		});
	};

	render() {
		const {classes} = this.props;
		return (
			<Formik
				initialValues = {{
					username: '',
					password: '',
				}}
				validate={values => {
					const errors: Partial<Values> = {};
					if (!values.username) {
						errors.username = 'Required';
					} else if (
						!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.username)
					) {
						errors.username = 'Invalid email address';
					} else if (!values.password) {
						errors.password = 'Required';
					}
					return errors;
				}}
				onSubmit={(values, {setSubmitting}) => {
					setTimeout(() => {
						setSubmitting(false);
						this.handleLogin(values);
					}, 500);
				}}
			>
				{({ submitForm, isSubmitting }) => (
					<Container component="main" maxWidth="xs">
						<CssBaseline />
						<div className={classes.paper}>
							{this.state.errors.map(error => (
								<AlertMessage key={Math.random()} message={error} severity={'error'} />
							))}
							<Avatar className={classes.avatar}>
								<LockOutlinedIcon />
							</Avatar>
							<Typography component="h1" variant="h5">
								Login
							</Typography>
							<form className={classes.form} onSubmit={this.handleSubmit} noValidate>
								<Field
									component={TextField}
									variant="outlined"
									margin="normal"
									required
									fullWidth
									id="email"
									label="Email Address"
									name="username"
									autoComplete="email"
									autoFocus
									value={this.state.username}
									onChange={this.handleUsernameChange}
								/>
								<Field
									component={TextField}
									variant="outlined"
									margin="normal"
									required
									fullWidth
									name="password"
									label="Password"
									type="password"
									id="password"
									autoComplete="current-password"
									value={this.state.password}
									onChange={this.handlePasswordChange}
								/>
								{isSubmitting && <LinearProgress />}
								<Button
									type="submit"
									fullWidth
									variant="contained"
									color="primary"
									disabled={isSubmitting}
									className={classes.submit}
									onClick={submitForm}
								>
									Login
								</Button>
							</form>
						</div>
						<Box mt={8}>
							<Copyright />
						</Box>
					</Container>
				)}
			</Formik>
		);
	}
}

Login.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Login);
