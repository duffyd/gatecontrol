import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from '@material-ui/core';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

const UserInputs = ({ idx, userState, handleUserChange }) => {
	const userId = `user-${idx}`;
	return (
			<TableRow key={`${userId}`}>
			<TableCell component="th" scope="row">
				<Checkbox
					inputProps={{'data-idx': idx, 'data-name': 'userid', 'data-userid': userState[idx].userid}}
					name={userId}
					id={userId}
					checked={userState[idx].del}
					onChange={handleUserChange}
				/>
			</TableCell>
			<TableCell>
				{userState[idx].username}
			</TableCell>
		</TableRow>
	);
};

UserInputs.propTypes = {
	idx: PropTypes.number,
	userState: PropTypes.array,
	handleUserChange: PropTypes.func,
};

export default UserInputs;