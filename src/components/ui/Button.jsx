function Button({
  children,
  variant = 'primary',
  size,
  fullWidth,
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size && `btn--${size}`,
    fullWidth && 'btn--full',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

export default Button;
