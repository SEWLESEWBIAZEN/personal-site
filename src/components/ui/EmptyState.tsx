export function EmptyState({ message }: { message: string }) {
  return (
    <div className="empty-state">
      <span className="empty-state-mark" aria-hidden="true">
        &#10035;
      </span>
      <p>{message}</p>
    </div>
  );
}
