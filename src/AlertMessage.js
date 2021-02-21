import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function AlertMessage({message, severity}) {
	const [open, setOpen] = React.useState(true);
	
	const handleClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}

		setOpen(false);
	};

	return (
		<div>
			<Snackbar
				open={open}
				onClose={handleClose}
			>
				<Alert onClose={handleClose} severity={severity}>
					{message}
				</Alert>
			</Snackbar>
		</div>
	);
}
