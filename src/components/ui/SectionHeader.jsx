import React from 'react';

export default function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
      <div>
        <h2 className="text-3xl font-headline font-extrabold text-primary tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-on-surface-variant text-sm font-medium opacity-60">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
