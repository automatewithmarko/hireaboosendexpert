export function SellerAbout({ bio }: { bio: string }) {
  return (
    <div className="provider-section">
      <h3>About</h3>
      <p className="provider-bio">{bio}</p>
    </div>
  );
}
