# WordPress Blocks

A collection of custom Gutenberg blocks designed to extend the WordPress block editor with icons, dynamic data, and flexible content composition.

This project focuses on reusable and composable blocks that integrate naturally with the WordPress editor while remaining developer-friendly.

---

## Included Blocks

### Icon Picker Block

A utility block that allows users to select and insert icons directly into the editor.

**Features**

* Supports Dashicons (WordPress core icons)
* Supports social icons
* Can be reused inside other blocks
* Outputs editor-safe markup compatible with both editor and frontend

**Use cases**

* Buttons
* Feature lists
* Callouts
* Social links

---

### Icon List Block

A flexible list block powered by the Icon Picker.

**Features**

* Add, remove, and reorder list items
* Each list item includes:

  * An Icon Picker
  * A fully insertable inner block

    * Paragraph
    * Heading
    * Meta Field
    * Any other allowed block
* Built using InnerBlocks for maximum flexibility

**Use cases**

* Feature lists
* Services lists
* Benefits sections
* Custom content lists with icons

---

### Meta Field Block

A dynamic block that allows users to insert values from WordPress data sources directly into the editor.

**Features**

* Insert values from:

  * wp_options
  * Post meta
* Dynamic rendering
* Supports return format templates using placeholder tokens
* Works in both editor preview and frontend output

**Use cases**

* Display custom fields
* Output site options such as address or contact information
* Build dynamic layouts without writing PHP templates

---

## How to Use
Include the package into your project.
### Via Composer

```bash
composer require ziorwebdev/wordpress-blocks
```
After installation, the blocks will be available for your projects.
After Zior Web Dev
[https://github.com/ziorwebdev](https://github.com/ziorwebdev)
