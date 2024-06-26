import yaml from "yaml";
import { readFileSync, writeFileSync } from "fs";
import validTagsList from "./validTagsList.json" assert { type: "json" };

const changedFiles = process.env.CHANGED_FILES.split(" ");
console.log("changed files: ", changedFiles);
let invalidFrontmatterFiles = {};
let invalidTagsFiles = {};

// function to extract only frontmatter from MD content
// relies on frontmatter being sandwiched between ---
function extractFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  return match ? match[1] : null;
}

// function to process MD file and validate tag values
function validateFile(filePath) {
  // step 1 - check for valid frontmatter
  try {
    const markdownContent = readFileSync(filePath, "utf8");
    const frontMatterString = extractFrontMatter(markdownContent);

    if (frontMatterString) {
      const parsedFrontMatter = yaml.parse(frontMatterString);
      console.log(parsedFrontMatter);

      // step 2 - if valid frontmatter, validate tags
      let invalidTags = [];
      for (const [key, acceptedValues] of Object.entries(validTagsList)) {
        if (parsedFrontMatter.hasOwnProperty(key)) {
          const value = parsedFrontMatter[key];
          // Check if the value(s) are within the accepted values
          const valuesToCheck = Array.isArray(value) ? value : [value];
          const invalidValues = valuesToCheck.filter(
            (val) => !acceptedValues.includes(val)
          );

          if (invalidValues.length > 0) {
            invalidTags.push(`**${key}**: ${invalidValues.join(", ")}`);
          }
        }
      }

      if (invalidTags.length > 0) {
        // If there are invalid tags, save them with the filename
        invalidTagsFiles[filePath] = invalidTags;
      }
    } else {
      // Logically valid situation where no frontmatter is found, but we want to save it as an error for linting
      invalidFrontmatterFiles[filePath] =
        "Error: No frontmatter found or it is in an invalid format.";
    }
  } catch (error) {
    // Exception handling for file read errors or YAML parsing errors
    console.error(`An error occurred processing ${filePath}: ${error.message}`);
    invalidFrontmatterFiles[filePath] = `Error: ${error.message}`;
  }
}

// Entrypoint to this script
if (!changedFiles.length) {
  console.log("No MD files changed.");
} else {
  // Main function
  for (const file of changedFiles) {
    validateFile(file);
  }
}

// Generate markdown report
let reportContent = "";

if (Object.keys(invalidFrontmatterFiles).length > 0) {
  reportContent += `## :triangular_flag_on_post: Potential issue - invalid frontmatter\n\n**One or more of your committed Markdown files might be missing frontmatter or have an invalid structure.**\n\nIf your PR is to add or edit a project file, please double-check your frontmatter is wrapped in triple dashes (---).\n\n`;
  for (const [file, message] of Object.entries(invalidFrontmatterFiles)) {
    reportContent += `- **${file}**: ${message}\n`;
  }
}

if (Object.keys(invalidTagsFiles).length > 0) {
  reportContent += `## :triangular_flag_on_post: Potential issue - invalid tags\n\n**One or more of your committed Markdown files might have invalid tag values.** The below files contain tags that do not match the options [here](https://github.com/JaneliaSciComp/ossi-website/tree/main/.github/actions/validTagsList.json).\n`;
  for (const [file, tags] of Object.entries(invalidTagsFiles)) {
    reportContent += `\n**${file}:**\n`;
    for (const tag of tags) {
      reportContent += `- ${tag}\n`;
    }
  }
  reportContent += `\nIf your PR is adding new tag categories or options, you can disregard this warning. The repo maintainer will be in touch if they have any questions or concerns about your additions. \n\nIf you did **not** intend to add new tag categories or options, please carefully review your file(s) for the following common issues:\n- Capitalization or spelling errors\n- For empty tag categories, ensure that you either leave a space and empty square brackets following the colon, (e.g., \`category name: []\`), or comment out or delete the line in the frontmatter.\n\n**Add any corrections by pushing them to the branch from which you originated this pull request.**`;
}

if (reportContent) {
  writeFileSync("validation-report.md", reportContent);
  console.log("Validation report generated.");
} else {
  console.log("No validation issues found.");
}
