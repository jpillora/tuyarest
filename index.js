const TuyaDevice = require("tuyapi");
const fastify = require("fastify");

const server = fastify();

async function auth(request) {
  const a = request.headers.authorization;
  if (!/Basic (.+)/.test(a)) {
    throw `unauthorised`;
  }
  const s = Buffer.from(RegExp.$1, "base64").toString();
  const [id, key] = s.split(":");
  return { id, key };
}

function initTuya(opts) {
  if (!opts.id) {
    throw `missing id`;
  } else if (!opts.key) {
    throw `missing key`;
  } else if (!opts.ip) {
    throw `missing ip`;
  }
  let tuya = new TuyaDevice(opts);
  return tuya;
}

server.get("/:ip", async (request, reply) => {
  const { ip } = request.params;
  const { id, key } = await auth(request);
  const tuya = initTuya({ ip, id, key });
  let result = await tuya.get({ schema: true });
  if (!result.dps) {
    throw `expected dps prop`;
  }
  result = result.dps;
  reply.type("application/json").code(200);
  return { result };
});

server.get("/:ip/:dps", async (request, reply) => {
  const { ip, dps = "1" } = request.params;
  const { id, key } = await auth(request);
  const tuya = initTuya({ ip, id, key });
  const result = await tuya.get({ dps });
  reply.type("application/json").code(200);
  return { result };
});

async function set(request, reply) {
  const { body } = request;
  const { ip, dps = "1" } = request.params;
  const { id, key } = await auth(request);
  const tuya = initTuya({ ip, id, key });
  let set = body;
  //not provided? toggle!
  if (set === null) {
    const curr = await tuya.get({ dps });
    if (typeof curr !== "boolean") {
      throw `expected dps:${dps} to be bool`;
    }
    set = !curr;
  }
  const success = await tuya.set({ dps, set });
  reply.type("application/json").code(200);
  return { set, success };
}

server.put("/:ip", set);
server.put("/:ip/:dps", set);

server.setErrorHandler(function(error, request, reply) {
  reply.send(`Error: ${error.stack || error}`);
});

server.listen(3000, "0.0.0.0", (err, address) => {
  if (err) throw err;
  console.log(`server listening on ${address}`);
});
