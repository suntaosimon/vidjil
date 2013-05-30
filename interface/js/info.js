/* VIDJIL
 * License blablabla
 * date: 30/05/2013
 * version :0.0.01-a
 * 
 * info.js
 * 
 * contains tools to manipulate element of the left-container :
 * favorites list
 * clone list
 * info panel
 * 
 * 
 * 
 * content:
 * 
 * initTimeBar()
 * displayInfo(cloneID)
 * addToFavorite(cloneID)
 * addToList(cloneID)
 * 
 * TODO manipulation sur les listes
 * -trie par nom / par size
 * -voir par jonction/ par clone
 * -maj des % affiché en fonction du point de suivi
 */
  

  /*ajoute les boutons de changement de point de suivi(TODO integrer la timebar au graph )*/
  function initTimeBar(){
      var divParent = document.getElementById("timebar");
      divParent.innerHTML="";
      for(var i=0 ;i<junctions[0].size.length; i++){
	var a = document.createElement('a');
	a.time=i;
	a.id="test";
	a.className="button";
	a.onclick= function(){ changeT(this.time); }
	a.innerHTML="Time "+i;
	divParent.appendChild(a);
      }
  }

  
  /*genere le contenu du panel d'information avec les données d'un clone */
  function displayInfo(cloneID){
    var divParent = document.getElementById("info");
    divParent.innerHTML="";
    var div = document.createElement('div');
    div.id="infoClone";
    
    var div_name=document.createElement('div');
    div_name.appendChild(document.createTextNode(getname(cloneID)));
    div.appendChild(div_name);
    
    var div_exit=document.createElement('div');
    div_exit.onclick = function(){ freeSelect(); }
    div_exit.appendChild(document.createTextNode(" X deselect X"));
    div.appendChild(div_exit);
	
    var div_fav=document.createElement('div');
    div_fav.onclick = function(){ addToFavorite(cloneID); }
    div_fav.appendChild(document.createTextNode("^  ajouter aux favoris ^"));
    div.appendChild(div_fav);
    
    var div_notFav=document.createElement('div');
    div_notFav.onclick = function(){ addToList(cloneID); }
    div_notFav.appendChild(document.createTextNode("v retirer des favoris v"));
    div.appendChild(div_notFav);
    
    var div_seg=document.createElement('div');
    div_seg.onclick = function(){ addToSegmenter(cloneID); }
    div_seg.appendChild(document.createTextNode("> ajouter au comparateur >"));
    div.appendChild(div_seg);
    
    divParent.appendChild(div);
    
  }
  
  
  /*pure manipulation du dom, deplace un element du container listClone vers favoris*/
  function addToFavorite(cloneID){
    var clone = document.getElementById(cloneID);
    document.getElementById("listFav").appendChild(clone);
  }

  
  /*operation inverse*/
  function addToList(cloneID){
    var clone = document.getElementById(cloneID);
    document.getElementById("listClones").appendChild(clone);
  }
  