function RadioInput(props) {
  return <label><input type="radio" name={props.name} value={props.value} onChange={props.onChange} checked={props.codec === props.value}/>{props.label}</label>
}

export default RadioInput