export default interface PreviewToken {
  chain: string;
  token_address: string;
  name: string;
  symbol: string;
  image?: string;
  image_thumb?: string;
  image_stored?: boolean;
  stored_image?: string;
  stored_image_thumb?: string;
}
