const items = [
  "FULL-STACK ENGINEERING",
  "AI & AGENT SYSTEMS",
  "SYSTEM DESIGN",
  "PRODUCT THINKING",
  "AUTOMATION",
  "FULL-STACK ENGINEERING",
  "AI & AGENT SYSTEMS",
  "SYSTEM DESIGN",
  "PRODUCT THINKING",
  "AUTOMATION",
];

export function TickerSection() {
  return (
    <section className="ticker" aria-label="Areas of focus">
      <div className="ticker-track">
        {items.map((x, i) => (
          <span key={i}>
            {x}
            <b>&#10035;</b>
          </span>
        ))}
      </div>
    </section>
  );
}
