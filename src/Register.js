import React, { useState } from 'react';
import { Formik, Field } from 'formik';
import Avatar from '@material-ui/core/Avatar';
import { Button, LinearProgress, FormControlLabel, Radio } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Alert from '@material-ui/lab/Alert';
import { TextField, RadioGroup } from 'formik-material-ui';
import * as Yup from 'yup';
import { myConfig } from './config.js';

interface Values {
	username: string;
	password: string;
	role: string;
}

const RegisterSchema = Yup.object().shape({
	username: Yup.string()
		.email('Invalid email address')
		.required('Required'),
	password: Yup.string()
		.required('Required'),
	role: Yup.string()
		.required('Required'),
});

const useStyles = makeStyles((theme) => ({
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
		marginTop: theme.spacing(3),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

export default function Register() {
	const classes = useStyles();
	const [errors, setErrors] = useState([]);
	const [successes, setSuccesses] = useState([]);
	
	const handleRegister = values => {
		console.log(`username: ${values.username}, password: ${values.password}, role: ${values.role}`);
		fetch(`http://${myConfig.apiUrl}/api/register`, {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${window.localStorage.accessToken}`
			},
			body: JSON.stringify({
				username: values.username,
				password: values.password,
				role: values.role
			})
		})
		.then(response => {
			if (response.ok) {
				return response.json();
			}
			if (response.status === 400) {
				return response.json()
					.then(responseJson => {
						if (/^4.*$/.test(responseJson.status.toString())) {
							setErrors([...errors, responseJson.message]);
							setTimeout(function() {
								setErrors([]);
							}, 5000);
						}
						throw responseJson;
					})
			} 
		})
		.then(json => {
			setSuccesses([...successes, json.msg]);
			console.log(successes);
			setTimeout(function() {
				setSuccesses([]);
			}, 5000);
		})
		.catch(error => {
			console.log(error);
		})
	};
	
	return (
		<Formik
			initialValues = {{
				username: '',
				password: '',
				role: '',
			}}
			validationSchema={RegisterSchema}
			onSubmit={(values, {setSubmitting, resetForm}) => {
				setTimeout(() => {
					setSubmitting(false);
					handleRegister(values);
					resetForm({});
				}, 500);
			}}
		>
			{({ submitForm, isSubmitting }) => (
				<Container component="main" maxWidth="xs">
					<CssBaseline />
					<div className={classes.paper}>
						<div className={classes.root} style={{display:'block', minHeight: '68px'}}>
							{errors.map(error => (
								<Alert severity="error" key={error}>{error}</Alert>
							))}
							{successes.map(success => (
								<Alert severity="success" key={success}>{success}</Alert>
							))}
						</div>
						<Avatar className={classes.avatar}>
							<LockOutlinedIcon />
						</Avatar>
						<Typography component="h1" variant="h5">
							Register
						</Typography>
						<form className={classes.form} noValidate>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<Field
										component={TextField}
										variant="outlined"
										required
										fullWidth
										id="email"
										label="Email Address"
										name="username"
										autoComplete="email"
									/>
								</Grid>
								<Grid item xs={12}>
									<Field
										component={TextField}
										variant="outlined"
										required
										fullWidth
										name="password"
										label="Password"
										type="password"
										id="password"
										autoComplete="current-password"
									/>
								</Grid>
								<Grid item xs={12}>
									<Field component={RadioGroup} name="role">
										<FormControlLabel
											value="user"
											control={<Radio disabled={isSubmitting} />}
											label="User"
											disabled={isSubmitting}
										/>
										<FormControlLabel
											value="admin"
											control={<Radio disabled={isSubmitting} />}
											label="Admin"
											disabled={isSubmitting}
										/>
									</Field>
								</Grid>
							</Grid>
							{isSubmitting && <LinearProgress />}
							<Button
								type="button"
								fullWidth
								variant="contained"
								color="primary"
								disabled={isSubmitting}
								className={classes.submit}
								onClick={submitForm}
							>
								Register
							</Button>
						</form>
					</div>
				</Container>
			)}
		</Formik>
	);
}
