export interface OAuthProvider {
  authorize_url: string;
  client_id: string;
  response_type: string;
  scope: string;
  gcf: string;
}
