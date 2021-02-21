import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import Protected from './Protected';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#286893',
		},
		secondary: {
			main: '#512893',
		},
	},
});

const styles = theme => ({
	paper: {
		marginTop: '0px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	button: {
		margin: theme.spacing(1),
	},
})

class App extends Component {
	render() {
		const {classes} = this.props;
		return (
			<ThemeProvider theme={theme}>
				<Container component="main" maxWidth="xs">
					<CssBaseline />
					<div className={classes.paper}>
						<Protected />
					</div>
				</Container>
			</ThemeProvider>
		);
	}
}

App.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);