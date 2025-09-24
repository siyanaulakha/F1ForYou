export default function Footer() {
  return (
    <footer className="f1-footer py-4 mt-auto">
      <div className="container text-center small">
        <div>© {new Date().getFullYear()} F1ForYou — fan-made educational site.</div>
        <div className="opacity-75">
          Data is illustrative. Edit JSON under <code>src/data/</code>.
        </div>
      </div>
    </footer>
  );
}
