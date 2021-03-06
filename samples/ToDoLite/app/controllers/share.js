var args = arguments[0] || {};

var list;
var myDocId;

// corresponds to couchTableSource:willUseCell:forRow:
function transform(model) {
   var result = model.toJSON();
   var personId = model.id;
   var member = false;
   
   if (myDocId === personId) {
     member = true;
   }
   else {
     member = _.contains(list.members || [], personId);
   }
   
   result.accessoryType = member ? Ti.UI.LIST_ACCESSORY_TYPE_CHECKMARK : Ti.UI.LIST_ACCESSORY_TYPE_NONE;
   
   return result;
}

function windowOpen() {
  if (!Alloy.Globals.cblSync.userID) {
    throw('no userID');
  }
  
  myDocId = 'p:' + Alloy.Globals.cblSync.userID;
  configureView();
}

function windowClose() {
  $.destroy();
}

function didSelectRow(e) {
  var toggleMemberId = e.itemId;
  var members = list.get('members') || [];
  var x = members.indexOf(toggleMemberId);
  if (x < 0) {
    // add to array
    members.push(toggleMemberId);
  }
  else {
    // remove from array
    members.splice(x, 1);
  }
  list.save({ members: members });
  
  // don't need to call configureView() again
}

function configureView() {
  list = Alloy.createModel('list');
  list.fetch({ id: args.list_id });
  
  $.profiles.fetch();
}
