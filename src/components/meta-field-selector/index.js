const { ComboboxControl, SelectControl } = wp.components;
const { useState, useEffect, useCallback } = wp.element;
const apiFetch = wp.apiFetch;
const { select } = wp.data;

const { debounce } = window.lodash;

export default function MetaFieldSelector() {
    const [metaFieldType, setMetaFieldType] = useState('post_meta');
    const [postType, setPostType] = useState('post');
    const [metaKey, setMetaKey] = useState('');
    const [options, setOptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Set current post type on editor load
    useEffect(() => {
        const currentPost = select('core/editor').getCurrentPost();
        if (currentPost) setPostType(currentPost.type);
    }, []);

    // Debounced fetch function
    const fetchOptions = useCallback(
        debounce((search) => {
            apiFetch({
                path: `/wordpress-blocks/v1/meta-keys?type=${metaFieldType}&post_type=${postType}&search=${search}`,
            }).then((results) => {
                setOptions(results.map((key) => ({ label: key, value: key })));
            });
        }, 300), // 300ms debounce
        [metaFieldType, postType]
    );

    // Trigger fetch when search term changes
    useEffect(() => {
        fetchOptions(searchTerm);
    }, [searchTerm, fetchOptions]);

    return (
        <>
            {/* Meta Field Type Dropdown */}
            <SelectControl
                label="Meta Field Type"
                value={metaFieldType}
                options={[
                    { label: 'Post Meta', value: 'post_meta' },
                    { label: 'Options', value: 'options' },
                ]}
                onChange={(value) => {
                    setMetaFieldType(value);
                    setMetaKey('');
                    setOptions([]);
                }}
            />

            {/* Meta Key Combobox */}
            <ComboboxControl
                label="Meta Key"
                value={metaKey}
                options={options}
                onChange={(val) => setMetaKey(val)}
                onFilterValueChange={(val) => setSearchTerm(val)}
                placeholder="Type to search meta keys..."
            />
        </>
    );
}
