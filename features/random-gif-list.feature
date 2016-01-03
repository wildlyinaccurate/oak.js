Feature: RandomGifList Component
  As a user
  I want to see potentially infinite funny animal gifs
  Because I am infinitely bored


  Scenario: Creating lots of gifs
    Given I am on the "RandomGifList" page
    # Then there should be a new cat gif # NOT IMPLEMENTED

    When I write "cats" into the input
    And I hit enter
    When I press the "More Please!" button
    Then there should be a new cat gif
    And there should be 1 total requests for "cats" gifs

    When I hit enter
    And I press the 2nd "more" button
    Then there should be 2 total requests for "cats" gifs

    When I write "dogs" into the input
    And I hit enter
    When I press the 3rd "more" button
    Then there should be 1 total requests for "dogs" gifs