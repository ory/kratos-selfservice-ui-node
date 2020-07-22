const url = new URL(
  '/auth/hydra/login?login_challenge=efbf26fcd8ac40f28b53ced9c9a2b8e7',
  'http://127.0.0.1:3000'
)

console.log(url.toString())
