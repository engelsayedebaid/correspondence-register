function Input({
  label,
  id,
  icon,
  error,
  className = '',
  wrapperClassName = '',
  ...props
}) {
  const inputId = id || (label ? label.replace(/\s/g, '-') : undefined);

  return (
    <div className={`form-group ${wrapperClassName}`}>
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={icon ? 'input-wrapper' : undefined}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={inputId}
          className={`form-input ${error ? 'form-input--error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

export default Input;
