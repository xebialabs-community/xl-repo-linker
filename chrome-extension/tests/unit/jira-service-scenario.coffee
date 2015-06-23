describe "Jira Service Scenario", ->

  beforeEach module "xl-repo-linker"

  it "should check on start-up whether Jira is accessible", ->
    expect("bla").toBeTrue