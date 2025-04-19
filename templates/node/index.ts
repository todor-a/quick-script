import { randomInt } from "crypto";
import fs from "fs";
import { parseArgs } from "node:util";

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

const user = await fetch(`https://dummyjson.com/users/${randomInt(100)}`).then(data => data.json());

fs.writeFileSync(
	"input.json",
	JSON.stringify(
		{
            user: {
                id: user.id,
                email: user.email
            },
			args: { ...args.values },
			env: {token: process.env.API_TOKEN},
		},
		null,
		2,
	),
);
