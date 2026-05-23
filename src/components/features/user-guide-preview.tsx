import ReactMarkdown from "react-markdown";

type UserGuidePreviewProps = {
  value: string;
};

export function UserGuidePreview({ value }: UserGuidePreviewProps) {
  if (!value.trim()) {
    return <p className="text-sm text-slate-400">Chưa có user guide.</p>;
  }

  return (
    <div className="prose prose-slate max-w-none text-sm prose-headings:mb-2 prose-headings:mt-3 prose-p:my-2 prose-ul:my-2 prose-li:my-0">
      <ReactMarkdown skipHtml>{value}</ReactMarkdown>
    </div>
  );
}
