'use client'

interface EditorToolbarProps {
  formatText: (command: string, value?: string) => void
}

export default function EditorToolbar({ formatText }: EditorToolbarProps) {
  const toolbarOptions = [
    { command: 'bold', icon: 'format_bold', tooltip: 'Bold (Ctrl+B)' },
    { command: 'italic', icon: 'format_italic', tooltip: 'Italic (Ctrl+I)' },
    { command: 'underline', icon: 'format_underlined', tooltip: 'Underline (Ctrl+U)' },
    { command: 'strikeThrough', icon: 'strikethrough_s', tooltip: 'Strikethrough' },
    { command: 'separator' },
    { command: 'justifyLeft', icon: 'format_align_left', tooltip: 'Align Left' },
    { command: 'justifyCenter', icon: 'format_align_center', tooltip: 'Align Center' },
    { command: 'justifyRight', icon: 'format_align_right', tooltip: 'Align Right' },
    { command: 'justifyFull', icon: 'format_align_justify', tooltip: 'Justify' },
    { command: 'separator' },
    { command: 'insertUnorderedList', icon: 'format_list_bulleted', tooltip: 'Bullet List' },
    { command: 'insertOrderedList', icon: 'format_list_numbered', tooltip: 'Numbered List' },
    { command: 'outdent', icon: 'format_indent_decrease', tooltip: 'Decrease Indent' },
    { command: 'indent', icon: 'format_indent_increase', tooltip: 'Increase Indent' },
    { command: 'separator' },
    { command: 'insertLink', icon: 'link', tooltip: 'Insert Link' },
    { command: 'insertImage', icon: 'image', tooltip: 'Insert Image' },
    { command: 'separator' },
    { command: 'removeFormat', icon: 'format_clear', tooltip: 'Clear Formatting' },
  ]

  const headingOptions = [
    { value: '<h1>', label: 'Heading 1' },
    { value: '<h2>', label: 'Heading 2' },
    { value: '<h3>', label: 'Heading 3' },
    { value: '<h4>', label: 'Heading 4' },
    { value: '<h5>', label: 'Heading 5' },
    { value: '<h6>', label: 'Heading 6' },
    { value: '<p>', label: 'Paragraph' },
  ]

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formatText('formatBlock', e.target.value)
  }

  const handleInsertLink = () => {
    const url = prompt('Enter URL:')
    if (url) formatText('createLink', url)
  }

  const handleInsertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) formatText('insertImage', url)
  }

  return (
    <div className="editor-toolbar bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap items-center">
      <select 
        onChange={handleHeadingChange}
        className="mr-2 p-1 text-sm border rounded bg-white dark:bg-gray-700 dark:text-white"
      >
        <option value="">Format</option>
        {headingOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {toolbarOptions.map((option, index) => {
        if (option.command === 'separator') {
          return <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
        }
        
        if (option.command === 'insertLink') {
          return (
            <button
              key={index}
              onClick={handleInsertLink}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title={option.tooltip}
            >
              <span className="material-icons text-lg">{option.icon}</span>
            </button>
          )
        }
        
        if (option.command === 'insertImage') {
          return (
            <button
              key={index}
              onClick={handleInsertImage}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title={option.tooltip}
            >
              <span className="material-icons text-lg">{option.icon}</span>
            </button>
          )
        }
        
        return (
          <button
            key={index}
            onClick={() => formatText(option.command)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title={option.tooltip}
          >
            <span className="material-icons text-lg">{option.icon}</span>
          </button>
        )
      })}
    </div>
  )
} 