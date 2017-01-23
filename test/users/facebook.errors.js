const UNAUTHORIZED_EXPECTED_BODY = {
  'error': {
    'message': 'Error validating access token: Session has expired on Thursday, 24-Nov-16 09:00:00 PST. The current time is Sunday, 27-Nov-16 03:53:06 PST.',
    'type': 'OAuthException',
    'code': 190,
    'error_subcode': 463,
    'fbtrace_id': 'AKRnl+WDgsf'
  }
}
const UNAUTHORIZED = {
  'body': JSON.stringify(UNAUTHORIZED_EXPECTED_BODY),
  'expectedBody': UNAUTHORIZED_EXPECTED_BODY,
  'status': 401
}

const OK = {
  'body': JSON.stringify({
    'id': '1234567891',
    'name': 'On My Travel Support',
    'email': 'contact.onmy@travel.com'
  }),
  'status': 200
}

module.exports = {
  UNAUTHORIZED, OK
}
