// Renders schema.org structured data (JSON-LD). Works in server components.
export default function JsonLd({ data }: { data: object }) {
    return (
        <script
            type="application/ld+json"
            // "<" is escaped so text inside the data can never close the script tag
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
        />
    );
}
