import 'jsr:@std/dotenv/load';

import { parseArgs } from 'jsr:@std/cli/parse-args';
import { randomIntegerBetween } from 'jsr:@std/random';

interface User {
    id: string;
    email: string;
}

const args = parseArgs(Deno.args, {
    string: ['url'],
    boolean: ['dry'],
});

const user = (await fetch(
    `https://dummyjson.com/users/${randomIntegerBetween(1, 100)}`,
).then((data) => data.json())) as User;

const data = {
    user: {
        id: user.id,
        email: user.email,
    },
    args: { ...args },
    env: { token: Deno.env.get('API_TOKEN') },
};

Deno.writeTextFile('input.json', JSON.stringify(data, null, 2));

console.log(
    '%cExecution completed.',
    'color: green',
    '\n',
    JSON.stringify({ data }, null, 2),
);
