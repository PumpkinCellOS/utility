<?php
require_once("lib/generator.php");
$generator = new PCUGenerator("Tilify Sandbox");
$generator->scripts = ["tilify-sandbox.js"];
$generator->start_content();
?>
<h2>Tilify Sandbox</h2>
<a is="tlf-resizable-tile">test1</a>
<a is="tlf-resizable-tile">test2</a>
<a is="tlf-resizable-tile">test3</a>
<a is="tlf-resizable-tile">test4</a>
<div class="app-list small">
    <a is="tlf-button-tile">test1</a>
    <a is="tlf-button-tile">test2</a>
    <a is="tlf-button-tile">test3</a>
    <a is="tlf-button-tile">test4</a>
</div>
<tlf-combobox>
    <option value="1">option1</option>
    <option value="2">option2</option>
    <option value="3">option3</option>
    <option value="4">option4</option>
    <option value="1">option1</option>
    <option value="2">option2</option>
    <option value="3">option3</option>
    <option value="4">option4</option>
    <option value="1">option1</option>
    <option value="2">option2</option>
    <option value="3">option3</option>
    <option value="4">option4</option>
</tlf-combobox>
<tlf-background-tile>
test
<div id="data">

</div>
</tlf-background-tile>
<tlf-background-tile padding="big">
    <h3>H3 in BPBT</h3>
    <p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <h4>H4 H4 H4 H4 H4 H4 H4</h4>
    <p>
Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
    </p>
</tlf-background-tile>
<?php
$generator->finish();
?>
