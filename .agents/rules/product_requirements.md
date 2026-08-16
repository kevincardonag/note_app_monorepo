---
name: Product Requirements
description: The core user journey and business logic requirements for the Note-Taking Application.
---

# Product Requirements

The application must adhere to the following user journey and features:

## Authentication
- Upon first use, the user encounters a sign-up screen to enter an email and password, with the ability to toggle password visibility. 
- Existing users can navigate to a login page instead.

## Initial State & Business Logic
- New accounts begin with an empty state and automatically generated categories: "Random Thoughts", "School", and "Personal".
*(Backend note: This should be handled via a Django signal upon user creation).*

## Creating Notes
- Users can create a new note by clicking the new note icon. 
- Notes are automatically saved upon creation.

## Note Structure and Editing
- Notes include a title, content, a category, and a "last edited" timestamp that updates automatically as the user types or edits.
- Changing a note's category updates its background color to match the color associated with that category.
- Users can edit the title, content, and category of existing notes.

## Viewing and Filtering Notes
- The main screen displays categories on the left, showing the associated color, title, and the number of notes in each.
- Selecting a category filters the notes shown; selecting "all categories" displays all notes.
- Notes appear as preview cards containing the date, category name, title, and content, with content truncated if it exceeds the card size.
- Dates are displayed as month and day, using "Today" or "Yesterday" for recent notes and excluding the year.
