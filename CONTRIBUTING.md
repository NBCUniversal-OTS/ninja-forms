# Contibuting To Ninja Forms

This document describes the workflow for contributing to Ninja Forms. It is expected that engineers employed by Saturday Drive will follow these standards. If you are a community member who wants to contribute, that is great. We really appreciate if you follow these standards and it makes it more likely we will approve your merge request.

## Opening Isssues

Because each commit and MR MUST reference an issue number, without exception. So the first step is to open an issue exception. Issues should include:

* A short but descriptive title
    * NOT Acceptable: "Form submission busted"
    * Acceptable: "JavaScript error on form submission with required checkbox group field"
* A detailed description of the bug or feature. Including:
    * For bugs, include what you expected to happen and what happened instead. Include detailed steps to reproduce. It is GREAT if you attatch a form export file to the issue.
    * For features, there should already be a Basecamp pitch/ project. Provide a short sumamry of the change and a checklist of the steps that are needed to complete the feature.
* What version of Ninja Forms, WordPress and other plugins and themes are in use.

NOTE: Security-related bugs should be opened as confidential issues.

## Naming Branches

All changes to Ninja Forms should be made on a branch, that is branched from the "develop" branch. You should NOT make commits to develop, including in your own fork. Always create a new branch.

When working on ANY change, work MUST be done on a feature branch named for the issue. In the form of `<issue-number>-short-description` For example, if assigned issue #4242 and it relates to input event binding, use branch `4242-input-binding`.

The issue number MUST go first in the branch name. Please keep branch names short.


### Commit Messages

Each commit message MUST include the issue number. If no issue exists, create one. Without an issue number, we have no record of WHY the change is being made. ALWAYS use the # charecter. GitLab will link #42 to issue #42.

Each commit should change ONE thing and one thing ONLY. If your commit message uses "and" you're probably doing more than one thing in a commit.

[Commit messages should be impartive](https://chris.beams.io/posts/git-commit/#imperative) :

* ACCEPTABLE: "Add event binding for inputs #4242" <- imperative mood
* NOT ACCEPTABLE: "Fixed event binding #4242" <- indicative mood

The first example says what we did. The second example says we fixed a bug, but how? By adding event binding, so write that.

Every single commit MUST have a descriptive title and a reference to the issue number in the commit message. If you are working on issue 4242 and the issue is to fix a missing dependency for conditionals then your commit message will be something 

* ACCEPTABLE: "Add missing dependency for conditional logic #4242".
* NOT ACCEPTABLE: "Add missing dependency for conditional logic and fixed a typo in conditional editor #4242" <- Commit is for two things  
* NOT ACCEPTABLE: "Add missing dependency for conditional logic." <- Commit message is missing # so Github will not associate it with the issue number.
* NOT ACCEPTABLE: "Fix conditional logic #4242". <- No explanation of what changed.

## Submitting An MR
Once you have a made a commit, open an MR, and mark it as work in progress. It is generally very good to submit an MR before it is complete for discussion.


### Submitting A Merge Request

Name the MR with a short title that describes the change. The auto-generated titles Gitlab creates are NOT acceptable.

In the issue description, you MUST include:

* A reference to the issue(s) the MR resolves.
    * If no issue exists, create one.
* Include the issue number in the description, not the title.
    * This links the issue and the MR, making it easier to find the issue from the MR and the MR from the issue.
* A description of what has changed.
    * Do not write "fixed issue #218" say "added sanitization to input. fixes #218" then explain where and why santization was added.
* How to test.
    * Narrate the steps a user would take to use the feature being added/fixed.
* Describe your automated tests.
    * What tests did you add to prove the issue exists and that it was fixed.
* Attatch exports of any forms or other configuration files that you used to test.
    * You did the work, don't make a team mate re-do it.
