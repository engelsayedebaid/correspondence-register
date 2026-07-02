const VARIANT_MAP = {
  incoming: 'badge--incoming',
  outgoing: 'badge--outgoing',
  pending: 'badge--pending',
  completed: 'badge--completed',
  urgent: 'badge--urgent',
  public: 'badge--public',
  restricted: 'badge--restricted',
  secret: 'badge--secret',
  'top-secret': 'badge--top-secret',
};

function Badge({ variant, children, className = '' }) {
  const variantClass = VARIANT_MAP[variant] || '';
  return (
    <span className={`badge ${variantClass} ${className}`.trim()}>
      {children}
    </span>
  );
}

export default Badge;
