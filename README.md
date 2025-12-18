WordPress Blocks

A collection of custom Gutenberg blocks designed to extend the WordPress block editor with icons, dynamic data, and flexible content composition.

This project focuses on reusable, composable blocks that integrate naturally with the WordPress editor while remaining developer-friendly.

📦 Included Blocks
1. Icon Picker Block

A utility block that allows users to select and insert icons directly into the editor.

Features

Supports Dashicons (WordPress core icons)

Supports social icons

Designed to be reusable and embeddable inside other blocks

Outputs editor-safe markup compatible with both editor and frontend

Use cases

Buttons

Feature lists

Callouts

Social links

2. Icon List Block

A flexible list block powered by the Icon Picker.

Features

Add, remove, and reorder list items

Each list item includes:

An Icon Picker

A fully insertable inner block

Paragraph

Heading

Meta Field block

Any other allowed block

Built using InnerBlocks for maximum flexibility

Use cases

Feature lists

Services lists

Benefits sections

Custom content lists with icons

3. Meta Field Block

A dynamic block that allows users to insert values from WordPress data sources directly into the editor.

Features

Insert values from:

wp_options

Post meta

Dynamic rendering

Supports template/return formats using placeholder tokens

Designed for both editor preview and frontend output

Use cases

Display custom fields

Output site options (e.g. address, contact info)

Build dynamic layouts without writing PHP templates

Node.js 18+ (for development)

PHP 7.4+
