const Messages = ({ className = '', messages }) => {
  return (
    <div className={'messages ' + className}>
      {messages &&
        messages.map((item, i) => (
          <div className={'message ' + item.type} key={i}>
            {item.text}
          </div>
        ))}
    </div>
  )
}

export default Messages
