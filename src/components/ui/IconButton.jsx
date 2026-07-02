function IconButton({ children, variant, className = '', title, ...props }) {
  const classes = [
    'icon-btn',
    variant && `icon-btn--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type="button" className={classes} title={title} {...props}>
      {children}
    </button>
  );
}

export default IconButton;
