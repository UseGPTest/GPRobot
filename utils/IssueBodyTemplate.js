function UnitTestIssueBodyTemplate(unitTest, filePath, fileExtension = "js") {
    return `## Ta-da! Here's the unit test for ${filePath} 
    ${unitTest}`;
}

module.exports = { UnitTestIssueBodyTemplate };