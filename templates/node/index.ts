import { randomInt } from "crypto";
import fs from "fs";
import { parseArgs, styleText } from "node:util";

interface User {
	id: string;
	email: string;
}

const args = parseArgs({
	options: {
		url: {
			type: "string",
		},
		dry: {
			type: "boolean",
			default: true,
		},
	},
});

const user = await fetch(`https://dummyjson.com/users/${randomInt(100)}`).then(data => data.json()) as User;

const data = {
	user: {
		id: user.id,
		email: user.email
	},
	args: { ...args.values },
	env: { token: process.env.API_TOKEN },
};

fs.writeFileSync(
	"input.json",
	JSON.stringify(
		data,
		null,
		2,
	),
);

console.log(styleText('green', 'Execution completed.'), '\n', JSON.stringify({ data }, null, 2));