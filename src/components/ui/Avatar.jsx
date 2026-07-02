const SIZES = ['sm', 'md', 'lg'];

function Avatar({ initials, colorClass = 'c1', size = 'md' }) {
  const sizeClass = SIZES.includes(size) ? `avatar--${size}` : 'avatar--md';
  return (
    <span className={`avatar ${sizeClass} ${colorClass}`}>
      {initials}
    </span>
  );
}

export default Avatar;
