interface ToggleSwitchProps {
  checked: boolean
  onChange?: () => void
  disabled?: boolean
}

export function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      onClick={disabled ? undefined : onChange}
      disabled={disabled}
      className="flex border-none p-[3px]"
      style={{
        width: 46,
        height: 27,
        borderRadius: 20,
        background: checked
          ? 'linear-gradient(90deg, #b78d3d, #d6b25c)'
          : 'rgba(233,220,198,.14)',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        transition: 'background .2s',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        className="block rounded-full bg-text-primary"
        style={{
          width: 21,
          height: 21,
          transition: 'all .2s',
        }}
      />
    </button>
  )
}
