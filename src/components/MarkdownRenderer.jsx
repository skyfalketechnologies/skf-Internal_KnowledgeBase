import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none
      prose-headings:text-white prose-headings:font-bold
      prose-p:text-neutral-300 prose-p:leading-relaxed
      prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-white
      prose-code:text-green-400 prose-code:bg-neutral-800 prose-code:px-1 prose-code:rounded
      prose-pre:bg-neutral-800 prose-pre:border prose-pre:border-neutral-700
      prose-blockquote:border-l-white prose-blockquote:text-neutral-400
      prose-ul:text-neutral-300 prose-ol:text-neutral-300
      prose-li:text-neutral-300
      prose-hr:border-neutral-700
      prose-table:text-neutral-300
      prose-th:text-white prose-th:border-neutral-700
      prose-td:border-neutral-700
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}