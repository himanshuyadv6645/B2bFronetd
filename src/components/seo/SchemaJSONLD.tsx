import { useEffect } from 'react';

interface SchemaJSONLDProps {
  schema: Record<string, unknown>;
}

export function SchemaJSONLD({ schema }: SchemaJSONLDProps) {
  useEffect(() => {
    if (!schema || Object.keys(schema).length === 0) return;

    const scriptId = 'seo-schema-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(schema);

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [schema]);

  return null;
}
