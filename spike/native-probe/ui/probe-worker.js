self.onmessage = async (e) => {
  const { okUrl, forbiddenUrl } = e.data;
  const out = {};
  try {
    const i32 = new Int32Array(new SharedArrayBuffer(8));
    out.sab = Atomics.wait(i32, 0, 0, 10) === 'timed-out';
  } catch (err) { out.sab = false; out.sabError = String(err); }
  try {
    const r = await fetch(okUrl);
    out.workerFetch = { status: r.status, bytes: (await r.arrayBuffer()).byteLength };
  } catch (err) { out.workerFetch = { error: String(err) }; }
  try {
    out.workerFetchForbidden = (await fetch(forbiddenUrl)).status;
  } catch (err) { out.workerFetchForbidden = { error: String(err) }; }
  self.postMessage(out);
};
