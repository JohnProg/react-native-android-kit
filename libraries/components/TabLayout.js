import React, {Component, PropTypes, View, ViewPagerAndroid} from "react-native";

const RNAKTabLayout = React.requireNativeComponent('TabLayoutAndroid', TabLayout, {});

export class TabLayout extends Component {
	//static variable non supporté par es6, il faut utiliser méthode static get pour en simuler le comportement:
	/*static get REF_VIEWPAGER() {
	 return 'ViewPager';
	 }*/
	//Mais babel accepte pour react les variables statiques: cf. http://babeljs.io/blog/2015/06/07/react-on-es6-plus/
	static REF_VIEWPAGER = 'refViewPager';
	static REF_TABLAYOUT = 'refTabLayout';
	static propTypes = {
		...View.propTypes,
		tabColor: React.PropTypes.string,
		indicatorTabColor: React.PropTypes.string,
		indicatorTabHeight: React.PropTypes.number,
		textColor: React.PropTypes.string,
		selectedTextColor: React.PropTypes.string,
		scrollable: React.PropTypes.bool,
		backgroundImage: React.PropTypes.string
	};
	static defaultProps = {
		height: 60,
	};

	constructor(props) {
		super(props);
		this.tabsSettings = new Array();
	}

	componentDidMount() {
		//Nous dispatchons nos commandes à notre code natif lorsque le composant
		//est monté (pour être certain que tous les composants ont bien été référencés):
		this.attachViewPager();
	}

	manageChildren() {
		let children = this.props.children;
		if(children) {
			if(!this.containMixViews(children)) {
				this.props.children.forEach((obj, key, array) => {
					/*let {
					 children,
					 ...others
					 } = obj.props;*/
					//let tabSettings = {};
					let tabSettings = new Object;
					for(let propKey in obj.props) {
						//On exclue les objets dans notre array pour éviter les boucles
						//cycliques dans les propriétés des children lors de l'envoie
						//du tableau de propriétés à notre code natif:
						let propValue = obj.props[propKey];
						if(typeof propValue !== 'object')
							tabSettings[propKey] = propValue;
					}
					this.tabsSettings.push(tabSettings);
				});

				return children;
			}

			console.warn('TabLayoutAndroid View must only have TabAndroid as direct children');
			return null;
		}
		else {
			console.warn('No Children, use TabAndroid tag to add some children');
			return null;
		}
	}

	//TabLayoutAndroid ne doit contenir que des vues Tab pour gérer tabsSettings,
	//containMixViews permet de checker la présence de vues mixtes (or Tab)
	//retourne true si vues mixtes:
	containMixViews(children) {
		if(children) {
			//some() renvoie true si la fonction callback renvoie true pour
			//au moins un des éléments du tableau, sinon elle renvoie false:
			return children.some((obj, key, array) => {
				if(obj.type.name !== 'TabAndroid' || obj.type.__proto__.name !== 'Tab')
					return true;
			});
		}
		return true;
	}

	attachViewPager() {
		//findNodeHandle retourne l'id du node référencé dans render du composant:
		//let viewPagerId = React.findNodeHandle(this.refs.refViewPager);
		let viewPagerId = React.findNodeHandle(this.refs[TabLayout.REF_VIEWPAGER]);

		//On envoie l'id du composant ViewPager à notre composant natif TabLayoutAndroid
		//pour construire notre TabLayout avec notre ViewPager via la commande native setupWithViewPager:
		React.UIManager.dispatchViewManagerCommand(
			React.findNodeHandle(this.refs[TabLayout.REF_TABLAYOUT]),
			React.UIManager['TabLayoutAndroid'].Commands['setupWithViewPager'],
			[viewPagerId, this.tabsSettings]
		);
		//React.UIManager['TabLayoutAndroid'].Commands['setupWithViewPager'] <=> React.UIManager.TabLayoutAndroid.Commands.setupWithViewPager
	}

	render() {
		/* ViewPagerAndroid ne peut pas être en parent sinon erreur: "Each ViewPager child must be a <View>"
		 Or RNAKTabLayout est de type TabLayout:*/
		//Aucun poids n'est attribué à RNAKTabLayout car il a une hauteur fixe par défaut;
		//ViewPager a un poids flex égal à 1 (flex:1 ~= flex-grow:1) pour lui permettre
		//tout l'espace libre restant du composant root View:
		return (
			<View style={{flex:1}}>
				<RNAKTabLayout ref={TabLayout.REF_TABLAYOUT}
					{...this.props}>
				</RNAKTabLayout>
				<ViewPagerAndroid ref={TabLayout.REF_VIEWPAGER} style={{flex:1}}>
					{this.manageChildren()}
				</ViewPagerAndroid>
			</View>
		);
	}
}

export class Tab extends Component {
	static propTypes = {
		...View.propTypes,
		text: React.PropTypes.string,
		icon: React.PropTypes.string
	};

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View {...this.props}>
				{this.props.children}
			</View>
		);
	}
}
