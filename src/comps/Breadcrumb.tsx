export default function Breadcrumb({ segments }) {
  return (
    <span class="task-Suggest-b-segs">
      {segments.map(({ label, name, uuid }, i) => (
        <>
          <span
            key={uuid}
            className="task-Suggest-b-label"
            dangerouslySetInnerHTML={{ __html: label }}
          ></span>
          {i + 1 < segments.length && (
            <span class="task-Suggest-b-spacer mx-2 opacity-50">➤</span>
          )}
        </>
      ))}
    </span>
  )
}
