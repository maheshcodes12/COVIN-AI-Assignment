// Validation for 'equal' mode
export function validateEqualMode(total_amount, participants) {
	const equalSplitAmount = total_amount / participants.length;
	for (const participant of participants) {
		if (participant.split_amount !== equalSplitAmount) {
			throw new Error("Split amounts should be equal for 'equal' mode");
		}
		if (participant.paid_amount !== equalSplitAmount) {
			throw new Error("Split amounts should be equal for 'equal' mode");
		}
		if (participant.split_amount < 0 || participant.paid_amount < 0) {
			throw new Error("Negative values are not allowed");
		}
	}
}

export function validateExactMode(total_amount, participants) {
	let totalSplitAmount = 0;
	let totalPaidAmount = 0;
	participants.forEach((participant) => {
		totalPaidAmount += participant.paid_amount;
		totalSplitAmount += participant.split_amount;
	});
	console.log(totalPaidAmount);

	if (totalSplitAmount !== total_amount) {
		throw new Error(
			"Total split amounts must equal the total expense amount in 'exact' mode"
		);
	}
	if (totalPaidAmount !== total_amount) {
		throw new Error(
			"Total paid amounts must equal the total expense amount in 'exact' mode"
		);
	}
	if (totalPaidAmount < 0 || totalSplitAmount < 0) {
		throw new Error("Negative values are not allowed");
	}
}

export function validatePercentageMode(total_amount, participants) {
	let totalPercentage = 0;
	participants.forEach((participant) => {
		totalPercentage += participant.split_amount;
	});
	if (totalPercentage !== 100) {
		throw new Error("Total percentage must be 100% in 'percentage' mode");
	}
	for (const participant of participants) {
		if (participant.split_amount < 0 || participant.paid_amount < 0) {
			throw new Error("Negative values are not allowed");
		}
		// Convert percentage to actual amount
		participant.split_amount = (participant.split_amount / 100) * total_amount;
	}
}
