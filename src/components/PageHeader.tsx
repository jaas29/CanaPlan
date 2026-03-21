interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-on-surface)]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
