import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Alert from '@material-ui/lab/Alert';
import UserInputs from './UserInputs';
import { myConfig } from './config.js';

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
	table: {
		minWidth: 650,
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(3),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

export default function Manage() {
	const classes = useStyles();
	const [errors, setErrors] = useState([]);
	const [successes, setSuccesses] = useState([]);
	const [userState, setUserState] = useState([]);
	const [open, setOpen] = useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleSubmit = event => {
		event.preventDefault();
		handleClickOpen();
	}
	
	const handleAgree = () => {
		console.log("I agree!");
		handleClose();
		handleDelete();
	};

	const handleDisagree = () => {
		console.log("I do not agree.");
		handleClose();
	};
	
	const handleUserChange = (e) => {
		const updatedUsers = [...userState];
		updatedUsers[e.target.dataset.idx]['del'] = e.target.checked;
		setUserState(updatedUsers);
	};
	
	useEffect(() => {
		listUsers();
	}, []);
	
	const listUsers = () => {
		fetch(`http://${myConfig.apiUrl}/api/list_users`, {
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
			const userData = json.users;
			userData.forEach(user => user['del'] = false);
			setUserState(userData);
		})
		.catch(error => {
			console.log(error);
			setErrors([...errors, error]);
			setTimeout(function() {
				setErrors([]);
			}, 5000);
		})
	}
	
	const handleDelete = () => {
		console.log(`userids: ${userState}`);
		fetch(`http://${myConfig.apiUrl}/api/delete`, {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${window.localStorage.accessToken}`
			},
			body: JSON.stringify({
				userdata: userState,
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
			listUsers();
		})
		.catch(error => {
			console.log(error);
		})
	};
	
	return (
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
				<Typography component="h1" variant="h5">
					Manage Users
				</Typography>
					
				{open && (
					<Dialog
						disableBackdropClick
						disableEscapeKeyDown
						open={open}
						onClose={handleClose}
					>
						<DialogTitle id="alert-dialog-title">{"Delete the selected user(s)?"}</DialogTitle>
						<DialogContent>
							<DialogContentText id="alert-dialog-description">
								This will permanently delete the selected user(s). Are you sure?
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button onClick={handleDisagree} color="primary">
								Cancel
							</Button>
							<Button onClick={handleAgree} color="primary" autoFocus>
								OK
							</Button>
						</DialogActions>
					</Dialog>
				)}
				<form className={classes.form} noValidate>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TableContainer component={Paper}>
								<Table className={classes.table}>
									<TableHead>
										<TableRow>
											<TableCell style={{width: '42px'}}><DeleteForeverIcon style={{display: 'block', margin: '0 auto'}}/></TableCell>
											<TableCell>Username</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{userState.map((val, idx) => (
											<UserInputs
												key={`user-${idx}`}
												idx={idx}
												userState={userState}
												handleUserChange={handleUserChange}
											/>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</Grid>
					</Grid>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						className={classes.submit}
						onClick={handleSubmit}
					>
						Process
					</Button>
				</form>
			</div>
		</Container>
	);
}
