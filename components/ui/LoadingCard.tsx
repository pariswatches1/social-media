"use client";

export default function LoadingCard() {
  return (
    <div style={{ background: "#0d1017", border: "1px solid #1e2535", borderRadius: 12, padding: 20 }}>
      {[80, 60, 90, 40].map((w, i) => (
        <div
          key={i}
          className="shimmer"
          style={{
            height: 12,
            width: `${w}%`,
            borderRadius: 6,
            marginBottom: i < 3 ? 12 : 0,
          }}
        />
      ))}
    </div>
  );
}
